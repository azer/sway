defmodule SwayWeb.PrivateMemberView do
  use SwayWeb, :view
  alias SwayWeb.APIView
  alias SwayWeb.PrivateMemberView

  def links(member, acc) do
    acc
    |> APIView.append_user(member.user_id)
    |> APIView.append_room(member.room_id)
  end

  def render("index.json", %{private_members: members}) do
    %{
      list: render_many(members, PrivateMemberView, "private_member.json"),
      links: APIView.render_links(APIView.many_links(members, fn member, acc -> links(member, acc) end))
    }
  end

  def render("show.json", %{private_member: member}) do
    %{data: render_one(member, PrivateMemberView, "private_member.json")}
  end

  def render("private_member.json", %{private_member: member}) do
    APIView.render_row(encode(member), :private_members)
  end

  def encode(member) do
    %{
      id: SwayWeb.Hashing.encode_private_member(member.id),
      room_id: SwayWeb.Hashing.encode_room(member.room_id),
      user_id: SwayWeb.Hashing.encode_user(member.user_id),
      inserted_at: member.inserted_at
    }
  end
end
