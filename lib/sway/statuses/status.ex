defmodule Sway.Statuses.Status do
  use Ecto.Schema
  import Ecto.Changeset

  schema "statuses" do
    field :message, :string
    field :status, Ecto.Enum, values: [:social, :solo, :focus, :zen]
    field :is_active, :boolean

    belongs_to :user, Sway.Accounts.User
    belongs_to :room, Sway.Rooms.Room
    belongs_to :workspace, Sway.Workspaces.Workspace

    timestamps()
  end

  @doc false
  def changeset(status, attrs) do
    status
    |> cast(attrs, [:status, :message, :user_id, :room_id, :workspace_id, :is_active])
    |> validate_required([:status, :user_id, :room_id, :workspace_id])
  end
end
