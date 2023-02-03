defmodule SwayWeb.UserOauthController do
  use SwayWeb, :controller
  alias Sway.Accounts
  alias SwayWeb.UserAuth
  plug Ueberauth
  @rand_pass_length 32

  def callback(%{assigns: %{ueberauth_auth: %{info: user_info}}} = conn, %{"provider" => "google"}) do
    email = user_info.email
    domain = Enum.at(String.split(email, "@"), 1)
    #name = hd(String.split(domain, "."))

    cond do
      # user already has account
      user = Sway.Accounts.get_user_by_email(email) ->
        UserAuth.log_in_user(conn, user)

      # user has an invitation
      invite = Sway.Invites.get_invite_by_email!(email, [:workspace]) ->
        {:ok, user} =
          Sway.Accounts.register_user(%{
            email: email,
            name: user_info.name,
            password: random_password(),
            profile_photo_url: user_info.image
          })

        {:ok, membership} =
          Sway.Workspaces.create_membership(%{
            workspace_id: invite.workspace.id,
            user_id: user.id
          })

        UserAuth.log_in_user(conn, user)

      # user has no invitation but there is a workspace for his email domain
      workspace = Sway.Workspaces.get_workspace_by_domain(domain) ->
        {:ok, user} =
          Sway.Accounts.register_user(%{
            email: email,
            name: user_info.name,
            password: random_password(),
            profile_photo_url: user_info.image
          })

        {:ok, membership} =
          Sway.Workspaces.create_membership(%{
            workspace_id: workspace.id,
            user_id: user.id
          })

        UserAuth.log_in_user(conn, user)

      true ->
        conn
        |> put_flash(:error, "Oops! You don't have an invite to join Sway yet.")
        |> redirect(to: "/login")
    end

  end

  def callback(conn, _params) do
    conn
    |> put_flash(:error, "Authentication failed")
    |> redirect(to: "/")
  end

  defp random_password do
    :crypto.strong_rand_bytes(@rand_pass_length) |> Base.encode64()
  end
end
