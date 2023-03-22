defmodule Sway.Rooms.PrivateMember do
  use Ecto.Schema
  import Ecto.Changeset

  schema "private_room_members" do
    belongs_to :room, Sway.Rooms.Room
    belongs_to :user, Sway.Accounts.User

    timestamps()
  end

  @doc false
  def changeset(private_member, attrs) do
    private_member
    |> cast(attrs, [:room_id, :user_id])
    |> validate_required([:room_id, :user_id])
  end
end
