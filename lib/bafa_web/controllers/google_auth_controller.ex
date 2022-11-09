defmodule BafaWeb.GoogleAuthController do
  use BafaWeb, :controller

  def index(conn, %{"code" => code}) do
    {:ok, token} = ElixirAuthGoogle.get_token(code, conn)
    {:ok, profile} = ElixirAuthGoogle.get_user_profile(token.access_token)

    IO.inspect(token)
    IO.inspect(profile)

    conn
    |> put_view(BafaWeb.AppView)
    |> render("index.html", profile: profile)
  end
end
