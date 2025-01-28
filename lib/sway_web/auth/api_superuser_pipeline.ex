defmodule SwayWeb.ApiSuperuserPipeline do
  use SwayWeb, :controller
  alias Sway.Accounts.User

  def init(default), do: default

  def call(conn, _) do
    case Guardian.Plug.current_resource(conn) do
      %User{} = user when user.is_superuser ->
        conn |> assign(:current_user, user)
      _ ->
        conn
        |> put_status(403)
	|> put_view(SwayWeb.ApiSessionView)
        |> render("error.json", message: "Unauthorized: Only superusers can access this endpoint")
	end
  end
end
