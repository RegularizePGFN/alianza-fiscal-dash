// …imports mantidos
export const useSaveSale = (updateSalesList: UpdateSalesListFunction) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSale = async (
    saleData: Omit<Sale, "id">,
    editingSaleId?: string
  ): Promise<boolean> => {
    if (isSaving) return false;
    setIsSaving(true);

    try {
      // validação mínima
      if (!saleData.gross_amount || isNaN(saleData.gross_amount) || saleData.gross_amount <= 0) {
        throw new Error("Valor bruto deve ser maior que zero");
      }

      /* transforma enum → string */
      const supabaseData = {
        ...saleData,
        payment_method: saleData.payment_method.toString(),
      };

      let result;
      if (editingSaleId) {
        result = await supabase
          .from("sales")
          .update(supabaseData)
          .eq("id", editingSaleId)
          .select();
      } else {
        result = await supabase.from("sales").insert(supabaseData).select();
      }

      if (result.error) throw result.error;

      /* atualiza lista local */
      const row = result.data![0];
      const savedSale: Sale = {
        ...saleData,
        id: editingSaleId ?? row.id,
        created_at: row.created_at,
      };
      updateSalesList(savedSale, !editingSaleId);

      return true;
    } catch (err: any) {
      showErrorToast(toast, err.message || "Erro ao salvar venda.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { handleSaveSale, isSaving };
};
