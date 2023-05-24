defmodule SwayWeb.WorkspaceMemberController do
  use SwayWeb, :controller

  alias Sway.Workspaces
  alias Sway.Workspaces.Membership

  action_fallback SwayWeb.FallbackController

  def index(conn, _params) do
    memberships = Sway.Workspaces.list_memberships()
    render(conn, "index.json", workspace_members: memberships)
  end

  def create(conn, %{"workspace_member" => params}) do
    attrs = %{
      workspace_id: SwayWeb.Hashing.decode_workspace(params["workspace_id"]),
      user_id: SwayWeb.Hashing.decode_user(params["user_id"]),
    }

    case Workspaces.create_membership(attrs) do
      {:ok, membership} ->
        conn
        |> put_status(:created)
        |> put_resp_header("location", Routes.workspace_member_path(conn, :show, membership))
        |> render("show.json", workspace_member: membership)

      {:error, changeset} ->
        conn
        |> put_status(:bad_request)
        |> render(SwayWeb.ChangesetView, "error.json", changeset: changeset)
    end
  end

  def show(conn, %{"id" => raw_id}) do
    id = SwayWeb.Hashing.decode_membership(raw_id)
    membership = Workspaces.get_membership!(id)
    render(conn, "show.json", workspace_member: membership)
  end

  def update(conn, %{"id" => raw_id, "workspace_member" => membership_params}) do
    id = SwayWeb.Hashing.decode_membership(raw_id)
    membership = Workspaces.get_membership!(id)

    with {:ok, %Membership{} = membership} <-
           Workspaces.update_membership(membership, membership_params) do
      render(conn, "show.json", workspace_member: membership)
    else
      {:error, changeset} ->
        conn
        |> put_status(:bad_request)
        |> render(SwayWeb.ChangesetView, "error.json", changeset: changeset)
    end
  end

  def delete(conn, %{"id" => raw_id}) do
    id = SwayWeb.Hashing.decode_membership(raw_id)
    membership = Workspaces.get_membership!(id)

    with {:ok, %Membership{}} <- Workspaces.update_membership(membership, %{is_active: false}) do
      render(conn, "show.json", workspace_member: membership)
    end
  end
end
