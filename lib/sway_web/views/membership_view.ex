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
    encode(membership)
  end

  def encode(membership) do
    %{
      id: SwayWeb.Hashing.encode_membership(membership.id),
      workspace_id: SwayWeb.Hashing.encode_workspace(membership.workspace_id),
      user_id: SwayWeb.Hashing.encode_user(membership.user_id),
      is_admin: membership.is_admin,
      inserted_at: membership.inserted_at
    }
  end
end
