defmodule Bafa.Repo.Migrations.AddLogoUrlToOrg do
  use Ecto.Migration

  def change do
    alter table(:orgs) do
      add :logo_url, :string
    end
  end
end
