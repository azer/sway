defmodule Bafa.Statuses.Status do
  use Ecto.Schema
  import Ecto.Changeset

  schema "statuses" do
    field :message, :string
    field :status, Ecto.Enum, values: [:focus, :active, :away, :dnd]

    belongs_to :user, Bafa.Accounts.User
    belongs_to :room, Bafa.Rooms.Room

    timestamps()
  end

  @doc false
  def changeset(status, attrs) do
    status
    |> cast(attrs, [:status, :message, :user_id, :room_id])
    |> validate_required([:status, :user_id])
  end
end
