import axios from 'axios';

interface ViaCEPPostalCodeResponse {
    cep: string;
    uf: string;
    localidade: string;
    bairro: string;
    logradouro: string;
}

export async function getPostalCodeInfo(
    postalCode: string
): Promise<ViaCEPPostalCodeResponse> {
    const { data } = await axios.get<ViaCEPPostalCodeResponse>(
        `https://viacep.com.br/ws/${postalCode}/json/`
    );

    return data;
}
