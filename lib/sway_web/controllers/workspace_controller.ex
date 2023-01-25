defmodule SwayWeb.WorkspaceController do
  use SwayWeb, :controller

  alias Sway.Workspaces
  alias Sway.Workspaces.Workspace

  action_fallback SwayWeb.FallbackController

  def index(conn, _params) do
    workspaces = Workspaces.list_workspaces()
    render(conn, "index.json", workspaces: workspaces)
  end

  def create(conn, %{"workspace" => workspace_params}) do
    with {:ok, %Workspace{} = workspace} <- Workspaces.create_workspace(workspace_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.workspace_path(conn, :show, workspace))
      |> render("show.json", workspace: workspace)
    end
  end

  def show(conn, %{"id" => id}) do
    workspace = Workspaces.get_workspace!(id)
    render(conn, "show.json", workspace: workspace)
  end

  def update(conn, %{"id" => id, "workspace" => workspace_params}) do
    workspace = Workspaces.get_workspace!(id)

    with {:ok, %Workspace{} = workspace} <- Workspaces.update_workspace(workspace, workspace_params) do
      render(conn, "show.json", workspace: workspace)
    end
  end

  def delete(conn, %{"id" => id}) do
    workspace = Workspaces.get_workspace!(id)

    with {:ok, %Workspace{}} <- Workspaces.delete_workspace(workspace) do
      send_resp(conn, :no_content, "")
    end
  end
end
