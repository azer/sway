defmodule SwayWeb.UserRegistrationController do
  use SwayWeb, :controller

  alias Sway.Accounts
  alias Sway.Accounts.User
  alias SwayWeb.UserAuth

  def new(conn, params) do
    [invite, invite_invalid] = Sway.Invites.get_invite_by_token(params["invite"])

    changeset = Accounts.change_user_registration(%User{})
    oauth_google_url = ElixirAuthGoogle.generate_oauth_url(conn)

    conn = cond do
      invite ->
	conn
	|> put_flash(:info, "You're invited by #{invite.created_by.name} to join #{invite.workspace.name}.")
      invite_invalid ->
	conn
	|> put_flash(:error, "Oops, your invite seems to be invalid.")
      true ->
	conn
    end

    render(conn, "new.html", changeset: changeset, invite_token: params["invite"], invite: invite, invite_invalid: invite_invalid, oauth_google_url: oauth_google_url)
  end

  def create(conn, %{"user" => user_params}) do
    [invite, invite_invalid] = Sway.Invites.get_invite_by_token(conn.params["invite_token"])

    case Accounts.register_user(user_params) do
      {:ok, user} ->
        {:ok, _} =
          Accounts.deliver_user_confirmation_instructions(
            user,
            &Routes.user_confirmation_url(conn, :edit, &1)
          )

	{:ok, membership} =
          Sway.Workspaces.create_membership(%{
            workspace_id: invite.workspace_id,
            user_id: user.id
          })

        conn
        |> put_flash(:info, "User created successfully.")
        |> UserAuth.log_in_user(user)

      {:error, %Ecto.Changeset{} = changeset} ->
	oauth_google_url = ElixirAuthGoogle.generate_oauth_url(conn)
        render(conn, "new.html", changeset: changeset, invite: invite, oauth_google_url: oauth_google_url, invite_token: conn.params["invite_token"])
    end
  end
end
