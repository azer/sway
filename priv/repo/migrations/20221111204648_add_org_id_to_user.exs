defmodule Sway.Repo.Migrations.AddOrgIdToUser do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :org_id, references(:orgs)
    end

    alter table(:orgs) do
      remove :org_id
    end
  end
end
