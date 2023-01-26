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
    cond do
      Sway.Accounts.get_user_by_email(invite_params["email"]) ->
        conn
        |> put_status(:conflict)
        |> json(%{error: "A user with this email already exists"})

      true ->
        with {:ok, %Invite{} = invite} <- Invites.create_invite(invite_params) do
          conn
          |> put_status(:created)
          |> put_resp_header("location", Routes.invite_path(conn, :show, invite))
          |> render("show.json", invite: invite)
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
