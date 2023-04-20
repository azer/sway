defmodule SwayWeb.BrowserAuthPlugWorkspace do
  use SwayWeb, :controller
  alias Sway.Accounts.User

  def init(default), do: default

  def call(conn, _) do
    if conn.assigns.current_user do
      [workspace, _] = Sway.Workspaces.get_membership_and_workspace(conn.assigns.current_user.id)
      conn |> assign(:current_workspace, workspace)
    else
      conn
    end
  end
end
