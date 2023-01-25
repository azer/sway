defmodule Sway.Workspaces.Workspace do
  use Ecto.Schema
  import Ecto.Changeset

  schema "workspaces" do
    field :domain, :string
    field :logo_url, :string
    field :name, :string

    timestamps()
  end

  @doc false
  def changeset(workspace, attrs) do
    workspace
    |> cast(attrs, [:name, :domain, :logo_url])
    |> validate_required([:name, :domain])
  end
end
