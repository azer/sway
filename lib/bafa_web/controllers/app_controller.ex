defmodule BafaWeb.AppController do
  use BafaWeb, :controller

  def index(conn, _params) do
    org = if conn.assigns.current_user.org_id != nil do
      Bafa.Accounts.get_org!(conn.assigns.current_user.org_id)
    end

    user_id = conn.assigns.current_user.id
    {:ok, room } = Bafa.Rooms.get_default_room(user_id, org.id)

    status = Bafa.Statuses.get_current_status(user_id, org.id)

    render(conn, "index.html", user: conn.assigns.current_user, org: org, room: room, status: status)
  end
end
