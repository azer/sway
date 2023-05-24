defmodule Sway.Repo.Migrations.AddUniqueIndexToMemberships do
  use Ecto.Migration

  def change do
    create unique_index(:memberships, [:user_id, :workspace_id])
  end
end
