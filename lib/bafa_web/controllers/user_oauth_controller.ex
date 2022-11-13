defmodule BafaWeb.UserOauthController do
  use BafaWeb, :controller
  alias Bafa.Accounts
  alias BafaWeb.UserAuth
  plug Ueberauth
  @rand_pass_length 32

  def callback(%{assigns: %{ueberauth_auth: %{info: user_info}}} = conn, %{"provider" => "google"}) do
    email = user_info.email
    domain = Enum.at(String.split(email, "@"), 1)
    name = hd String.split(domain, ".")

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
