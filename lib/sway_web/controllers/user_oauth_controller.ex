defmodule SwayWeb.UserOauthController do
  use SwayWeb, :controller
  alias Sway.Accounts
  alias SwayWeb.UserAuth
  plug Ueberauth
  @rand_pass_length 32

  def callback(conn, %{"provider" => "google"}) do
   %{assigns: %{ueberauth_auth: %{info: user_info}}} = conn

    email = user_info.email

    case login_by_email(email, user_info) do
      {:ok, user, workspace} ->
        conn
        |> put_session(:user_return_to, "/#{workspace.slug}")
        |> UserAuth.log_in_user(user)

      {:error, _reason} ->
        conn
        |> put_flash(:error, "Oops! You don't have an invite to join Sway yet.")
        |> redirect(to: "/login")
    end
  end


  defp random_password do
    :crypto.strong_rand_bytes(@rand_pass_length) |> Base.encode64()
  end

  def login_by_email(email, user_info) do
    domain = Enum.at(String.split(email, "@"), 1)

    cond do
      # user already has an account
      user = Sway.Accounts.get_user_by_email(email) ->
        [workspace, _] = Sway.Workspaces.get_membership_and_workspace(user.id)
        {:ok, user, workspace}

      # new user, with invitation
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

        workspace = Sway.Workspaces.get_workspace!(invite.workspace_id)
        {:ok, user, workspace}

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

        {:ok, user, workspace}

      true ->
        {:error, :no_invite}
    end
  end
end
