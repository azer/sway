defmodule Bafa.Statuses.Status do
  use Ecto.Schema
  import Ecto.Changeset

  schema "statuses" do
    field :ended_at, :naive_datetime
    field :message, :string
    field :started_at, :naive_datetime
    field :status, Ecto.Enum, values: [:focus, :active, :away]
    field :user_id, :id
    field :org_id, :id

    timestamps()
  end

  @doc false
  def changeset(status, attrs) do
    status
    |> cast(attrs, [:status, :message, :started_at, :ended_at])
    |> validate_required([:status, :message, :started_at, :ended_at])
  end
end
