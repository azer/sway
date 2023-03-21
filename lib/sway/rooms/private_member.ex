defmodule Sway.Rooms.PrivateMember do
  use Ecto.Schema
  import Ecto.Changeset

  schema "private_room_members" do
    field :room_id, :id
    field :user_id, :id

    timestamps()
  end

  @doc false
  def changeset(private_member, attrs) do
    private_member
    |> cast(attrs, [:room_id, :user_id])
    |> validate_required([:room_id, :user_id])
  end
end
