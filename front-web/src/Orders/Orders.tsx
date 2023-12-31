import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { checkIsSelected } from './helpers';

import OrderSummary from './OrderSummary/OrderSummary';

import StepsHeader from './StepsHeader/StepsHeader';

import './orders.css';
import { fetchProducts, saveOrder } from '../api';
import { OrderLocationData, Product } from './Types';
import ProductsList from './ProductList/ProductsList';
import Loading from '../Loading/Loading';
import OrderLocation from './Orderlocation/OrderLocation';


function Orders() {
	const [products, setProducts] = useState<Product[]>([]);
	const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
	const [orderLocation, setOrderLocation] = useState<OrderLocationData>();
	const [loading, setLoading] = useState(false);
	const [resError, setResError] = useState(false);
	const totalPrice = selectedProducts.reduce((sum, item) => {
		return sum + item.preco;
	}, 0);

	useEffect(() => {
		window.scrollTo(0, 0);
		fetchProducts()
			.then((response) => {
				setLoading(true);
				setProducts(response.data);
			})
			.catch((error) => {
				setResError(true);
				toast.warning('Erro ao listar produtos! Tente recarregar a página.');
			});
	}, []);

	const handleSelectProduct = (product: Product) => {
		const isAlreadySelected = checkIsSelected(selectedProducts, product);

		if (isAlreadySelected) {
			const selected = selectedProducts.filter((item) => item.id !== product.id);
			setSelectedProducts(selected);
		} else {
			setSelectedProducts((previous) => [...previous, product]);
		}
	};

	const handleSubmit = () => {
		const productsIds = selectedProducts.map(({ id }) => ({ id }));
		if (productsIds.length !== 0 && orderLocation !== undefined) {
			const payload = {
				...orderLocation!,
				products: productsIds,
			};

			saveOrder(payload)
				.then((response) => {
					window.scrollTo(0, 0);
					toast.error(`Pedido de Nº ${response.data.id} enviado com sucesso!`);
					setSelectedProducts([]);
					setOrderLocation(undefined);
				})
				.catch(() => {
					toast.error('Erro ao enviar pedido!');
				});
		} else if (productsIds.length === 0) {
			toast.warning('Selecione os produtos de seu pedido');
			window.scrollTo(0, 0);
		} else {
			toast.warning('Digite o endereço de entrega para confirmar seu pedido');
		}
	};

	return (
		<>
			<div className='orders-container'>
				<StepsHeader />

				{loading === true ? (
					<ProductsList
						products={products}
						onSelectProduct={handleSelectProduct}
						selectedProducts={selectedProducts}
					/>
				) : resError === false ? (
					<Loading message='Carregando produtos...' />
				) : null}
				<OrderLocation
					onChangeLocation={(location) => setOrderLocation(location)}
				/>
				<OrderSummary
					amount={selectedProducts.length}
					totalPrice={totalPrice}
					onSubmit={handleSubmit}
				/>
			</div>
		</>
	);
}

export default Orders;