defmodule SwayWeb.MembershipView do
  use SwayWeb, :view
  alias SwayWeb.MembershipView

  def render("index.json", %{memberships: memberships}) do
    %{data: render_many(memberships, MembershipView, "membership.json")}
  end

  def render("show.json", %{membership: membership}) do
    %{data: render_one(membership, MembershipView, "membership.json")}
  end

  def render("membership.json", %{membership: membership}) do
    %{
      id: membership.id,
      workspace_id: membership.workspace_id,
      user_id: membership.user_id,
      is_admin: membership.is_admin
    }
  end
end
