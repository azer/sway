defmodule SwayWeb.UserSessionController do
  use SwayWeb, :controller

  alias Sway.Accounts
  alias SwayWeb.UserAuth

  plug Ueberauth

  def new(conn, _params) do
    user_agent = get_req_header(conn, "user-agent") |> List.first()
    is_electron = user_agent && String.contains?(user_agent, "Electron")

    oauth_login_url = if is_electron do
      "/desktop/auth/oauth_login"
    else
      Routes.user_oauth_path(conn, :request, "google")
    end

    render(conn, "new.html", oauth_login_url: oauth_login_url, is_electron: is_electron, error_message: nil)
  end

  def create(conn, %{"user" => user_params}) do
    %{"email" => email, "password" => password} = user_params

    if user = Accounts.get_user_by_email_and_password(email, password) do
      [workspace, _] = Sway.Workspaces.get_membership_and_workspace(user.id)

      conn
      |> put_session(:user_return_to, "/#{workspace.slug}")
      |> UserAuth.log_in_user(user, user_params)
    else
      # In order to prevent user enumeration attacks, don't disclose whether the email is registered.
      render(conn, "new.html", error_message: "Invalid email or password")
    end
  end

  def delete(conn, _params) do
    conn
    |> put_flash(:info, "Logged out successfully.")
    |> clear_session()
    |> UserAuth.log_out_user()
  end
end
