defmodule Bafa.Statuses.Status do
  use Ecto.Schema
  import Ecto.Changeset

  schema "statuses" do
    field :ended_at, :naive_datetime
    field :message, :string
    field :started_at, :naive_datetime
    field :status, Ecto.Enum, values: [:focus, :active, :away, :dnd]

    belongs_to :user, Bafa.Accounts.User
    belongs_to :org, Bafa.Accounts.Org

    timestamps()
  end

  @doc false
  def changeset(status, attrs) do
    status
    |> cast(attrs, [:status, :message, :started_at, :ended_at, :user_id, :org_id])
    |> validate_required([:status, :message, :started_at, :ended_at])
  end
end
