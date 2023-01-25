defmodule Sway.Repo.Migrations.AddOrgId do
  use Ecto.Migration

  def change do
    alter table(:orgs) do
      add :org_id, references(:orgs)
    end

    alter table(:users) do
      add :profile_photo_url, :string
    end
  end
end
