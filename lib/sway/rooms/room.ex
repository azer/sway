defmodule Sway.Rooms.Room do
  use Ecto.Schema
  import Ecto.Changeset

  schema "rooms" do
    field :name, :string
    field :slug, :string
    field :is_default, :boolean
    field :is_active, :boolean
    field :is_private, :boolean, default: false

    belongs_to :workspace, Sway.Workspaces.Workspace
    belongs_to :user, Sway.Accounts.User
    has_many :room_members, Sway.Rooms.RoomMember

    timestamps()
  end

  @doc false
  def changeset(room, attrs) do
    room
    |> cast(attrs, [:name, :workspace_id, :user_id, :slug, :is_default, :is_active, :is_private])
    |> validate_required([:name, :workspace_id])
    |> unique_constraint(:slug, name: :rooms_slug_workspace_id_index)
  end
end
