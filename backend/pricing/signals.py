
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
from .models import Produto, TipoProduto
from core.utils import gerar_proximo_codigo
import logging

logger = logging.getLogger(__name__)

@receiver(pre_save, sender=Produto)
def atribuir_sku_em_novo_produto(sender, instance: Produto, **kwargs):
    """
    Gera SKU automaticamente apenas para produtos NOVOS
    que ainda não tenham código_sku definido.
    """
    
    # REGRA 1: Se o produto já existe (tem PK), não gera novo SKU
    if instance.pk is not None:
        return
    
    # REGRA 2: Se já tem SKU definido, respeita (permite definição manual)
    if instance.codigo_sku:
        logger.debug(f"Produto '{instance.nome}' já possui SKU: {instance.codigo_sku}")
        return
    
    # REGRA 3: Tipo do produto é obrigatório
    if not instance.tipo_id:
        erro = f"Produto '{instance.nome}' não possui tipo definido"
        logger.error(erro)
        raise ValidationError({"tipo": "O tipo do produto é obrigatório para gerar o SKU"})
    
    # REGRA 4: Empresa é obrigatória
    if not instance.empresa_id:
        erro = f"Produto '{instance.nome}' não possui empresa definida"
        logger.error(erro)
        raise ValidationError({"empresa": "A empresa é obrigatória para gerar o SKU"})
    
    # GERAÇÃO DO SKU
    try:
        # Busca o tipo do produto para pegar o prefixo
        tipo_obj = TipoProduto.objects.get(id=instance.tipo_id)
        prefixo = tipo_obj.tipo  # Ex: 'PA', 'MP', 'PI'
        chave_sequencia = f"SKU_{prefixo}"
        
        # Gera o código sequencial
        instance.codigo_sku = gerar_proximo_codigo(
            empresa_id=instance.empresa_id,
            chave=chave_sequencia,
            prefixo=prefixo,
            digitos=6
        )
        
        logger.info(
            f"SKU gerado com sucesso: {instance.codigo_sku} "
            f"para produto '{instance.nome}' (tipo: {prefixo})"
        )
        
    except TipoProduto.DoesNotExist:
        erro = f"Tipo de produto com ID {instance.tipo_id} não encontrado"
        logger.error(erro)
        raise ValidationError({"tipo": erro})
    
    except ValueError as e:
        # Erros vindos da função gerar_proximo_codigo
        logger.error(f"Erro ao gerar SKU: {str(e)}")
        raise ValidationError({"codigo_sku": f"Não foi possível gerar o SKU: {str(e)}"})
    
    except Exception as e:
        # Qualquer outro erro inesperado
        erro = f"Erro inesperado ao gerar SKU: {str(e)}"
        logger.exception(erro)  # Log com traceback completo
        raise ValidationError({"codigo_sku": erro})
