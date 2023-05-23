defmodule Sway.Repo.Migrations.AddIsActiveToWorkspaceMembers do
  use Ecto.Migration

  def change do
    alter table(:memberships) do
      add :is_active, :boolean, default: true
    end
  end
end
