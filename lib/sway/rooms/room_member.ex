defmodule Sway.Rooms.RoomMember do
  use Ecto.Schema
  import Ecto.Changeset

  schema "room_members" do
    field :is_active, :boolean, default: true

    belongs_to :room, Sway.Rooms.Room
    belongs_to :user, Sway.Accounts.User

    timestamps()
  end

  @doc false
  def changeset(room_member, attrs) do
    room_member
    |> cast(attrs, [:room_id, :user_id, :is_active])
    |> validate_required([:room_id, :user_id])
  end
end
