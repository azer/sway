defmodule Bafa.Accounts.Org do
  use Ecto.Schema
  import Ecto.Changeset

  schema "orgs" do
    field :domain, :string
    field :name, :string
    field :logo_url, :string

    timestamps()
  end

  @doc false
  def changeset(org, attrs) do
    org
    |> cast(attrs, [:name, :domain, :logo_url])
    |> validate_required([:name, :domain])
  end
end
