defmodule SwayWeb.MembershipController do
  use SwayWeb, :controller

  alias Sway.Workspaces
  alias Sway.Workspaces.Membership

  action_fallback SwayWeb.FallbackController

  def index(conn, _params) do
    memberships = Workspaces.list_memberships()
    render(conn, "index.json", memberships: memberships)
  end

  def create(conn, %{"membership" => membership_params}) do
    with {:ok, %Membership{} = membership} <- Workspaces.create_membership(membership_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.membership_path(conn, :show, membership))
      |> render("show.json", membership: membership)
    end
  end

  def show(conn, %{"id" => id}) do
    membership = Workspaces.get_membership!(id)
    render(conn, "show.json", membership: membership)
  end

  def update(conn, %{"id" => id, "membership" => membership_params}) do
    membership = Workspaces.get_membership!(id)

    with {:ok, %Membership{} = membership} <- Workspaces.update_membership(membership, membership_params) do
      render(conn, "show.json", membership: membership)
    end
  end

  def delete(conn, %{"id" => id}) do
    membership = Workspaces.get_membership!(id)

    with {:ok, %Membership{}} <- Workspaces.delete_membership(membership) do
      send_resp(conn, :no_content, "")
    end
  end
end
