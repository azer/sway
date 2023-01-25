defmodule SwayWeb.UserOauthController do
  use SwayWeb, :controller
  alias Sway.Accounts
  alias SwayWeb.UserAuth
  plug Ueberauth
  @rand_pass_length 32

  def callback(%{assigns: %{ueberauth_auth: %{info: user_info}}} = conn, %{"provider" => "google"}) do
    email = user_info.email
    domain = Enum.at(String.split(email, "@"), 1)
    name = hd(String.split(domain, "."))

    case Sway.Workspaces.get_workspace_by_domain(domain) do
      {:ok, workspace} ->
        case Accounts.get_user_by_email(email) do
          {:ok, user} ->
            UserAuth.log_in_user(conn, user)

          _ ->
            conn
            |> put_flash(:error, "Authentication failed")
            |> redirect(to: "/login")
        end
      nil ->
        conn
        |> put_flash(:error, "You don't have access to any workspace.")
        |> redirect(to: "/login")
    end

    """
    org = case Accounts.fetch_or_create_org(%{ name: name, domain: domain }) do
     {:ok, org} ->
       org
     _ ->
              conn
              |> put_flash(:error, "Unable to create org")
              |> redirect(to: "/")
       end

    user_params = %{name: user_info.name, email: user_info.email, password: random_password(), profile_photo_url: user_info.image, org_id: org.id }
    case Accounts.fetch_or_create_user(user_params) do
      {:ok, user} ->
        UserAuth.log_in_user(conn, user)
      _ ->
        conn
        |> put_flash(:error, "Authentication failed")
        |> redirect(to: "/")
    end
    """
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
