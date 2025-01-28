defmodule Sway.Repo.Migrations.RenamePrivateMembersToRoomMembers do
  use Ecto.Migration

  def up do
    rename table("private_room_members"), to: table("room_members")
  end

  def down do
    rename table("room_members"), to: table("private_room_members")
  end
end
