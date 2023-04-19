defmodule SwayWeb.WebsiteController do
  use SwayWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end

end
