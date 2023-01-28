defmodule SwayWeb.UserRegistrationController do
  use SwayWeb, :controller

  alias Sway.Accounts
  alias Sway.Accounts.User
  alias SwayWeb.UserAuth

  def new(conn, params) do
    [invite, invite_invalid] =
      case params["invite"] do
        nil ->
          [nil, nil]

        invite_token ->
          case Phoenix.Token.verify(SwayWeb.Endpoint, "salt", invite_token, max_age: 604800) do
            {:ok, claims} ->
	      [Sway.Invites.get_invite!(claims, [:workspace, :created_by]), false]
            _ ->
	      [nil, true]
          end
      end

    changeset = Accounts.change_user_registration(%User{})
    oauth_google_url = ElixirAuthGoogle.generate_oauth_url(conn)
    render(conn, "new.html", changeset: changeset, invite: invite, invite_invalid: invite_invalid, oauth_google_url: oauth_google_url)
  end

  def create(conn, %{"user" => user_params}) do
    case Accounts.register_user(user_params) do
      {:ok, user} ->
        {:ok, _} =
          Accounts.deliver_user_confirmation_instructions(
            user,
            &Routes.user_confirmation_url(conn, :edit, &1)
          )

        conn
        |> put_flash(:info, "User created successfully.")
        |> UserAuth.log_in_user(user)

      {:error, %Ecto.Changeset{} = changeset} ->
	oauth_google_url = ElixirAuthGoogle.generate_oauth_url(conn)
        render(conn, "new.html", changeset: changeset, invite: nil, oauth_google_url: oauth_google_url)
    end
  end
end
