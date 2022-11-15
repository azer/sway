defmodule Bafa.Rooms.Room do
  use Ecto.Schema
  import Ecto.Changeset

  schema "rooms" do
    field :name, :string
    belongs_to :org, Bafa.Accounts.Org
    belongs_to :user, Bafa.Accounts.User

    timestamps()
  end

  @doc false
  def changeset(room, attrs) do
    room
    |> cast(attrs, [:name, :org_id, :user_id])
    |> validate_required([:name])
  end
end
