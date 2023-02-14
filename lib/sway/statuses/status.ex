defmodule Sway.Statuses.Status do
  use Ecto.Schema
  import Ecto.Changeset

  schema "statuses" do
    field :message, :string
    field :status, Ecto.Enum, values: [:social, :solo, :focus, :zen]
    field :camera_on, :boolean, default: false
    field :mic_on, :boolean, default: false
    field :speaker_on, :boolean, default: false

    belongs_to :user, Sway.Accounts.User
    belongs_to :room, Sway.Rooms.Room
    belongs_to :workspace, Sway.Workspaces.Workspace

    timestamps()
  end

  @doc false
  def changeset(status, attrs) do
    status
    |> cast(attrs, [:status, :message, :user_id, :room_id, :workspace_id, :camera_on, :mic_on, :speaker_on])
    |> validate_required([:status, :user_id, :room_id, :workspace_id])
  end
end
