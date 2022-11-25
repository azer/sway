defmodule Bafa.Rooms.Room do
  use Ecto.Schema
  import Ecto.Changeset

  schema "rooms" do
    field :name, :string
    field :slug, :string
    field :is_default, :boolean

    belongs_to :org, Bafa.Accounts.Org
    belongs_to :user, Bafa.Accounts.User

    timestamps()
  end

  @doc false
  def changeset(room, attrs) do
    room
    |> cast(attrs, [:name, :org_id, :user_id, :slug, :is_default])
    |> validate_required([:name])
  end
end
