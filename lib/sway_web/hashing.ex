defmodule SwayWeb.Hashing do
  @alphabet "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
  @salt "sw:ay"
  @min_length 4

  def encode_workspace(id), do: encode(1, id)
  def decode_workspace(id), do: decode(1, id)
  def encode_room(id), do: encode(2, id)
  def decode_room(id), do: decode(2, id)
  def encode_user(id), do: encode(3, id)
  def decode_user(id), do: decode(3, id)
  def encode_status(id), do: encode(4, id)
  def decode_status(id), do: decode(4, id)
  def encode_room_member(id), do: encode(5, id)
  def decode_room_member(id), do: decode(5, id)
  def encode_membership(id), do: encode(6, id)
  def decode_membership(id), do: decode(6, id)
  def encode_message(id), do: encode(7, id)
  def decode_message(id), do: decode(7, id)
  def encode_blog(id), do: encode(8, id)
  def decode_blog(id), do: decode(8, id)
  def encode_auth_state(id), do: encode(999, id)
  def decode_auth_state(id), do: decode(999, id)

  def decode_any(hash) do
    hd(Hashids.decode!(provider(), hash))
  end

  defp encode(entity_salt, id) do
    Hashids.encode(provider(), [id, entity_salt])
  end

  defp decode(entity_salt, hash) do
    [result, decoded_entity_salt] = Hashids.decode!(provider(), hash)
    if entity_salt != decoded_entity_salt do
      raise ArgumentError, message: "Entity salt does not match the decoded salt"
    end

    result
  end

  defp provider() do
    Hashids.new(salt: @salt, alphabet: @alphabet, min_len: @min_length)
  end
end
