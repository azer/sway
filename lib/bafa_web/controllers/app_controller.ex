defmodule BafaWeb.AppController do
  use BafaWeb, :controller

  def index(conn, _params) do
    org = if conn.assigns.current_user.org_id != nil do
      Bafa.Accounts.get_org!(conn.assigns.current_user.org_id)
    end
    render(conn, "index.html", user: conn.assigns.current_user, org: org)
  end
end
