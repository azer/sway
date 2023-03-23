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
    encode(workspace)
  end

  def encode(workspace) do
    %{
      id: SwayWeb.Hashing.encode_workspace(workspace.id),
      name: workspace.name,
      slug: workspace.slug,
      domain: workspace.domain,
      is_active: workspace.is_active,
      logo_url: workspace.logo_url,
      inserted_at: workspace.inserted_at
    }
  end
end
