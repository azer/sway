defmodule SwayWeb.Hashing do
  @alphabet "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
  @salt "sw:ay"
  @min_length 4

  def encode_city(id), do: encode(1, id)
  def decode_city(id), do: decode(1, id)
  def encode_state(id), do: encode(2, id)
  def decode_state(id), do: decode(2, id)
  def encode_country(id), do: encode(3, id)
  def decode_country(id), do: decode(3, id)
  def encode_timezone(id), do: encode(4, id)
  def decode_timezone(id), do: decode(4, id)

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
