import { expect } from "chai";
import { ethers } from "hardhat";

describe("BinarySearch", function () {
    let c: any;

    beforeEach(async () => {
        const factory = await ethers.getContractFactory("BinarySearch");
        c = await factory.deploy();
    });

    const bi = (x: number) => BigInt(x);

    describe("binarySearchInt", () => {
        it("empty -> -1", async () => {
            expect(await c.binarySearchInt([], 123)).to.equal(-1n);
        });

        it("basic hits & misses", async () => {
            const arr = [-5, -1, 0, 2, 3];
            expect(await c.binarySearchInt(arr, -5)).to.equal(0n);
            expect(await c.binarySearchInt(arr, 3)).to.equal(4n);
            expect(await c.binarySearchInt(arr, 1)).to.equal(-1n);
        });

        it("duplicates: return any one index that equals target", async () => {
            const arr = [1, 1, 2, 2, 2, 3];
            const idx: bigint = await c.binarySearchInt(arr, 2);
            expect([2n, 3n, 4n]).to.include(idx);
            // 也可再断言值确实为 2
            const val: bigint = (arr as any)[Number(idx)];
            expect(val).to.equal(2n);
        });
    });

    describe("binarySearchUint", () => {
        it("empty -> -1", async () => {
            expect(await c.binarySearchUint([], 7)).to.equal(-1n);
        });

        it("basic hits & misses", async () => {
            const arr = [0, 1, 3, 5];
            expect(await c.binarySearchUint(arr, 3)).to.equal(2n);
            expect(await c.binarySearchUint(arr, 2)).to.equal(-1n);
        });
    });

    describe("lowerBoundInt", () => {
        it("positions", async () => {
            const arr = [1, 3, 3, 5];
            expect(await c.lowerBoundInt(arr, -1)).to.equal(0n);
            expect(await c.lowerBoundInt(arr, 1)).to.equal(0n);
            expect(await c.lowerBoundInt(arr, 3)).to.equal(1n);
            expect(await c.lowerBoundInt(arr, 4)).to.equal(3n);
            expect(await c.lowerBoundInt(arr, 6)).to.equal(4n); // 等于 length
        });
    });

    describe("lowerBoundUint", () => {
        it("positions", async () => {
            const arr = [1, 3, 3, 5];
            expect(await c.lowerBoundUint(arr, 0)).to.equal(0n);
            expect(await c.lowerBoundUint(arr, 3)).to.equal(1n);
            expect(await c.lowerBoundUint(arr, 4)).to.equal(3n);
            expect(await c.lowerBoundUint(arr, 6)).to.equal(4n);
        });
    });
});
