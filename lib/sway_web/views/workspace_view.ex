defmodule SwayWeb.WorkspaceView do
  use SwayWeb, :view
  alias SwayWeb.WorkspaceView

  def render("index.json", %{workspaces: workspaces}) do
    %{data: render_many(workspaces, WorkspaceView, "workspace.json")}
  end

  def render("show.json", %{workspace: workspace}) do
    %{data: render_one(workspace, WorkspaceView, "workspace.json")}
  end

  def render("workspace.json", %{workspace: workspace}) do
    %{
      id: workspace.id,
      name: workspace.name,
      domain: workspace.domain,
      logo_url: workspace.logo_url
    }
  end
end
