defmodule Sway.Invites.Invite do
  use Ecto.Schema
  import Ecto.Changeset

  schema "invites" do
    field :email, :string
    field :name, :string
    #field :workspace_id, :id
    #field :created_by, :id

    belongs_to :workspace, Sway.Workspaces.Workspace
    belongs_to :created_by, Sway.Accounts.User, source: :created_by

    timestamps()
  end

  @doc false
  def changeset(invite, attrs) do
    invite
    |> cast(attrs, [:name, :email, :workspace_id, :created_by_id])
    |> validate_required([:email, :name, :workspace_id, :created_by_id])
  end
end
