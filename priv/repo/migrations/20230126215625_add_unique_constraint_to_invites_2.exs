defmodule Sway.Repo.Migrations.AddUniqueConstraintToInvites2 do
  use Ecto.Migration

  def change do
    create unique_index(:invites, [:email])
  end
end
