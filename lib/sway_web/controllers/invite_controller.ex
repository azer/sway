defmodule SwayWeb.InviteController do
  use SwayWeb, :controller

  alias Sway.Invites
  alias Sway.Invites.Invite

  action_fallback SwayWeb.FallbackController

  def index(conn, _params) do
    invites = Invites.list_invites() |> Sway.Repo.preload([:workspace, :created_by])
    render(conn, "index.json", invites: invites)
  end

  def create(conn, %{"invite" => invite_params}) do
    invite_params = invite_params
    |> Map.put("created_by_id", SwayWeb.Hashing.decode_user(invite_params["created_by_id"]))
    |> Map.put("workspace_id", SwayWeb.Hashing.decode_workspace(invite_params["workspace_id"]))

    cond do
      Sway.Accounts.get_user_by_email(invite_params["email"]) ->
        conn
        |> put_status(:conflict)
        |> json(%{error: "A user with this email already exists"})

      invite = Sway.Invites.get_invite_by_email!(invite_params["email"]) ->
	invite = invite |> Sway.Repo.preload([:workspace, :created_by])
	token = Phoenix.Token.sign(SwayWeb.Endpoint, "salt", invite.id)

	conn
            |> put_status(:created)
            |> put_resp_header("location", Routes.invite_path(conn, :show, invite))
            |> render("show.json", invite: invite, token: token)

      true ->
	try do
          with {:ok, %Invite{} = invite} <- Invites.create_invite(invite_params) do
	    invite = invite |> Sway.Repo.preload([:workspace, :created_by])

	    token = Phoenix.Token.sign(SwayWeb.Endpoint, "salt", invite.id)

	    delivery = SwayWeb.InviteEmail.welcome(invite, token) |> Sway.Mailer.deliver()

	    IO.inspect(delivery, label: "mail delivery")

            conn
            |> put_status(:created)
            |> put_resp_header("location", Routes.invite_path(conn, :show, invite))
            |> render("show.json", invite: invite, token: token)
	  end
	rescue
	  Ecto.ConstraintError ->
	    conn
	    |> put_status(:unprocessable_entity)
	    |> render("error.json", message: "Invite with the same email already exists.")
        end
    end
  end

  def show(conn, %{"id" => id}) do
    invite = Invites.get_invite!(id, [:workspace, :created_by])
    render(conn, "show.json", invite: invite)
  end

  def update(conn, %{"id" => id, "invite" => invite_params}) do
    invite = Invites.get_invite!(id)

    with {:ok, %Invite{} = invite} <- Invites.update_invite(invite, invite_params) do
      render(conn, "show.json", invite: invite)
    end
  end

  def delete(conn, %{"id" => id}) do
    invite = Invites.get_invite!(id)

    with {:ok, %Invite{}} <- Invites.delete_invite(invite) do
      send_resp(conn, :no_content, "")
    end
  end
end
