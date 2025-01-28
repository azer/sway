defmodule SwayWeb.WebsiteController do
  use SwayWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def pricing(conn, _params) do
    render(conn, "pricing.html")
  end

  def about(conn, _params) do
    render(conn, "about.html")
  end

end
