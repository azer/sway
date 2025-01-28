defmodule SwayWeb.WorkspaceMemberView do
  use SwayWeb, :view
  alias SwayWeb.WorkspaceMemberView
  alias SwayWeb.APIView

  def links(resp, membership) do
    resp
    |> APIView.add_link(:users, SwayWeb.UserView, membership.user_id)
    |> APIView.add_link(:workspaces, SwayWeb.WorkspaceView, membership.workspace_id)
  end

  def render("index.json", %{workspace_members: memberships}) do
    %{
      list: render_many(memberships, WorkspaceMemberView, "membership.json"),
      links: APIView.links(:workspace_members, WorkspaceMemberView, memberships)
    }
  end

  def render("show.json", %{workspace_member: membership}) do
    %{
      result: render_one(membership, WorkspaceMemberView, "membership.json"),
      links: APIView.links(:workspace_members, WorkspaceMemberView, membership)
    }
  end

  def render("membership.json", %{workspace_member: membership}) do
    APIView.row(encode(membership), :memberships)
  end

  def encode(membership) do
    %{
      id: SwayWeb.Hashing.encode_membership(membership.id),
      workspace_id: SwayWeb.Hashing.encode_workspace(membership.workspace_id),
      user_id: SwayWeb.Hashing.encode_user(membership.user_id),
      is_active: membership.is_active,
      is_admin: membership.is_admin,
      inserted_at: membership.inserted_at
    }
  end
end
