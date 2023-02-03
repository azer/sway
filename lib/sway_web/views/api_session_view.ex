defmodule SwayWeb.ApiSessionView do
  use SwayWeb, :view
  alias SwayWeb.ApiSessionView

  def render("session_created.json", %{user: user, jwt: jwt}) do
    %{
      email: user.email,
      token: jwt
    }
  end

  def render("error.json", %{message: message}) do
    %{message: message }
  end
end
