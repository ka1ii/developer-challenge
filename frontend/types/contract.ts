interface Contract {
    cid: string;
    title: string;
    contract: string;
    amount: number;
    client: {
        address: string;
        username: string;
    }
    freelancer: {
        address: string;
        username: string;
    }
    handshake: boolean;
}

export default Contract;